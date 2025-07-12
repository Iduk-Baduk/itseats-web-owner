import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "./MenuOptionGroupModal.module.css";
import { UpArrayIcon, DownArrayIcon, DeleteIcon } from "../common/Icons";

export default function SortableOptionGroup({ 
  group, 
  index,
  onToggle,
  onDelete,
  onRequiredChange,
  onDeleteOption
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.groupName });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className={styles.optionGroupItem}>
        <div className={styles.optionGroupItemHeader}>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }} {...listeners}>
            <div onClick={(e) => {
              e.stopPropagation();
            }}>
              <input
                type="checkbox"
                checked={group.isRequired}
                onChange={(e) => onRequiredChange(index, e.target.checked)}
                className={styles.checkBox}
              />
            </div>
            <span className={styles.groupName}>{group.groupName}</span>
          </div>
          <div className={styles.itemActions}>
            <div
              onClick={(e) => {
                e.stopPropagation();
                onDelete(index);
              }}
              style={{ cursor: 'pointer' }}
            >
              <DeleteIcon className={styles.deleteButton} />
            </div>

            <button onClick={(e) => {
              e.stopPropagation();
              onToggle(index);
            }}>
              {group.isOpen ? <UpArrayIcon /> : <DownArrayIcon />}
            </button>
          </div>
        </div>

        {group.isOpen &&
          group.options.map((opt, i) => (
            <div key={i} className={styles.subOptionItem}>
              <span>{opt.name}</span>
              <span>{opt.price.toLocaleString()}원</span>
              <div 
                className={styles.deleteOption}
                onClick={() => onDeleteOption(index, i)}
              >
                ✕
              </div>
            </div>
          ))}
      </div>
    </div>
  );
} 
