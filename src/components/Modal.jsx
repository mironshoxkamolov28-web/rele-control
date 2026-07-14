export function Modal({ isOpen, onClose, children, maxWidth = 'max-w-lg' }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
      <div className={`relative w-full ${maxWidth} max-h-[90vh] overflow-y-auto animate-scale-in`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
