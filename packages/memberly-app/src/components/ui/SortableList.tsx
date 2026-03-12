'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {renderItem(item, { ...attributes, ...listeners })}
    </div>
  );
}

interface SortableListProps<T extends { id: string }> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (
    item: T,
    dragHandleProps: Record<string, unknown>
  ) => React.ReactNode;
}

export function SortableList<T extends { id: string }>({
  items: initialItems,
  onReorder,
  renderItem,
}: SortableListProps<T>) {
  const [items, setItems] = useState(initialItems);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);
    onReorder(newItems);
  };

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
    </DndContext>
  );
}
