export function SectionTitle({
  id,
  title,
  description,
}: {
  id?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <h2
        id={id}
        className="text-foreground text-balance text-3xl font-bold tracking-tight sm:text-4xl"
      >
        {title}
      </h2>
      {description && (
        <p className="text-muted-foreground mt-4 text-pretty text-lg leading-8">
          {description}
        </p>
      )}
    </div>
  );
}
