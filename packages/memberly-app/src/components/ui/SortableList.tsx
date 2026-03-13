'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemWrapperProps<T> {
  id: string;
  item: T;
  renderItem: (item: T, dragHandleProps: Record<string, unknown>) => React.ReactNode;
}

function SortableItemWrapper<T>({
  id,
  item,
  renderItem,
}: SortableItemWrapperProps<T>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {renderItem(item, {
        ...attributes,
        ...listeners,
        style: { touchAction: 'none', minWidth: 44, minHeight: 44, cursor: 'grab' },
      })}
    </div>
  );
}

interface SortableListProps<T extends { id: string }> {
  items: T[];
  onReorder: (items: T[]) => void | Promise<void>;
  renderItem: (
    item: T,
    dragHandleProps: Record<string, unknown>
  ) => React.ReactNode;
  renderDragOverlay?: (item: T) => React.ReactNode;
}

export function SortableList<T extends { id: string }>({
  items: initialItems,
  onReorder,
  renderItem,
  renderDragOverlay,
}: SortableListProps<T>) {
  const [items, setItems] = useState(initialItems);
  const [activeItem, setActiveItem] = useState<T | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const item = items.find((i) => i.id === event.active.id);
      setActiveItem(item ?? null);
    },
    [items]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveItem(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      const previousItems = [...items];
      const newItems = arrayMove(items, oldIndex, newIndex);

      setItems(newItems); // optimistic update

      try {
        await onReorder(newItems);
      } catch {
        setItems(previousItems); // rollback on error
      }
    },
    [items, onReorder]
  );

  // Sync with parent when items change externally
  if (
    initialItems.length !== items.length ||
    initialItems.some((item, i) => item.id !== items[i]?.id)
  ) {
    setItems(initialItems);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        {items.map((item) => (
          <SortableItemWrapper
            key={item.id}
            id={item.id}
            item={item}
            renderItem={renderItem}
          />
        ))}
      </SortableContext>

      <DragOverlay>
        {activeItem && renderDragOverlay ? (
          renderDragOverlay(activeItem)
        ) : activeItem ? (
          <div className="rounded-lg border border-blue-300 bg-blue-50 p-3 shadow-lg opacity-90">
            {renderItem(activeItem, {})}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
