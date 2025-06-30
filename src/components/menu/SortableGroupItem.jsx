import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "./MenuGroupModal.module.css";

export default function SortableGroupItem({ id, group, onDelete }) {
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
    cursor: "move",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className={styles.groupItem}>
        <div className={styles.groupTextContainer}>
          <span className={styles.groupText}>{group}</span>
          <div
            className={styles.groupCloseButton}
            onClick={onDelete}
          >
            ✕
          </div>
        </div>
      </div>
    </div>
  );
} 
 