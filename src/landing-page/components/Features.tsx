import { type LucideIcon } from "lucide-react";
import { SectionTitle } from "./SectionTitle";

export interface Feature {
  name: string;
  description: string;
  icon: LucideIcon;
}

export function Features({ features }: { features: Feature[] }) {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="mx-auto max-w-5xl px-6 pb-24 sm:pb-32 lg:px-8"
    >
      <SectionTitle
        id="features-heading"
        title="What you can do"
        description="Start with the basics. Add more whenever you need it."
      />
      <dl className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.name} className="relative pl-14">
            <dt className="text-foreground text-base font-semibold leading-7">
              <div className="border-border bg-muted absolute left-0 top-0 flex size-10 items-center justify-center rounded-lg border">
                <feature.icon className="text-foreground size-5" aria-hidden="true" />
              </div>
              {feature.name}
            </dt>
            <dd className="text-muted-foreground mt-1 text-pretty text-sm leading-6">
              {feature.description}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
