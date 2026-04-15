import React from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          width: '100%',
          maxWidth: 480,
          maxHeight: '80vh',
          overflowY: 'auto',
          animation: 'slideUp 0.3s ease-out',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '12px 0 4px 0',
          }}
        >
          <div
            style={{
              width: 32,
              height: 3,
              borderRadius: 1.5,
              backgroundColor: '#e5e5e5',
            }}
          />
        </div>

        {/* Title */}
        <div
          style={{
            padding: '8px 20px 16px 20px',
            fontSize: 18,
            fontWeight: 700,
            color: '#1e1e1e',
            letterSpacing: '-0.2px',
          }}
        >
          {title}
        </div>

        {/* Content */}
        <div style={{ padding: '0 20px 24px 20px' }}>{children}</div>
      </div>
    </div>
  );
};

export default BottomSheet;
