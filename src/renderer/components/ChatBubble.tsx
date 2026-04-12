export default function ChatBubble({ visible, text }: any) {
  if (!visible) return null;

  return <div className="chat-bubble">{text}</div>;
}