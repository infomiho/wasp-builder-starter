import type { User } from "wasp/entities";
import { Card, CardContent } from "../client/components/ui/card";
import { Separator } from "../client/components/ui/separator";
import { formatDate } from "../shared/format";

export function AccountPage({ user }: { user: User }) {
  return (
    <div className="py-10 lg:mt-10">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <h1 className="text-foreground text-4xl font-bold tracking-tight">Account</h1>
        <p className="text-muted-foreground mt-3 text-lg leading-8">
          The details of your account.
        </p>
        <Card className="mt-10">
          <CardContent className="p-0">
            <dl>
              <AccountDetail label="Username" value={user.username ?? "Not set"} />
              <Separator />
              <AccountDetail label="Member since" value={formatDate(user.createdAt)} />
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AccountDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
      <dt className="text-muted-foreground text-sm font-medium">{label}</dt>
      <dd className="text-foreground text-sm sm:col-span-2">{value}</dd>
    </div>
  );
}
