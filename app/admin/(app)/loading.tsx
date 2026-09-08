export default function Loading() {
  return (
    <div>
      <div className="skeleton h-8 w-44 mb-2" />
      <div className="skeleton h-4 w-28 mb-6" />
      <div className="grid gap-3">
        <div className="skeleton h-20" />
        <div className="skeleton h-20" />
        <div className="skeleton h-20" />
      </div>
    </div>
  );
}
