import styles from "./Tag.module.css";

type TagProps = {
  children: React.ReactNode;
  variant?: "default" | "accent";
  size?: "sm" | "md";
};

export function Tag({ children, variant = "default", size = "md" }: TagProps) {
  return <span className={`${styles.tag} ${styles[variant]} ${styles[size]}`}>{children}</span>;
}

export function TagList({ items, size = "md" }: { items: string[]; size?: "sm" | "md" }) {
  if (!items.length) return null;

  return (
    <div className={styles.list}>
      {items.map((item) => (
        <Tag key={item} size={size}>
          {item}
        </Tag>
      ))}
    </div>
  );
}
