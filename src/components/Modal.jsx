export function Modal({ isOpen, onClose, children, maxWidth = 'max-w-lg' }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
      <div
        className={`relative w-full ${maxWidth} max-h-[85vh] sm:max-h-[90vh] overflow-y-auto animate-sheet-up sm:animate-scale-in rounded-t-2xl sm:rounded-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag indicator */}
        <div className="sm:hidden flex justify-center pt-2 pb-1 sticky top-0 z-10">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>
        {children}
      </div>
    </div>
  );
}
