export const Empty = ({ title, text }: { title: string; text: string }) => {
  return (
    <div className="py-16 text-center">
      <p className="text-base font-bold">{title}</p>
      <p className="mt-1 text-sm text-muted">{text}</p>
    </div>
  )
}
