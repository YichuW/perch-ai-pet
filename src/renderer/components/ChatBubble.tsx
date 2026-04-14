interface ChatBubbleProps {
  text: string;
  onDismiss?: () => void;
}

export default function ChatBubble({ text, onDismiss }: ChatBubbleProps) {
  if (!text) return null;

  return (
    <div className="chat-bubble">
      {onDismiss && (
        <button className="chat-dismiss" onClick={onDismiss} aria-label="Dismiss">
          ×
        </button>
      )}
      <div className="chat-text">{text}</div>
      <div className="chat-tail" />
    </div>
  );
}
