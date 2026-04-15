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
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: '#d0d0d0',
            }}
          />
        </div>

        {/* Title */}
        <div
          style={{
            padding: '8px 20px 12px 20px',
            fontSize: 16,
            fontWeight: 'bold',
            color: '#333',
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
