
import { Store } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStoreStateProps {
  storeLimit: number;
}

export function EmptyStoreState({ storeLimit }: EmptyStoreStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
        <Store className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">У вас пока нет добавленных магазинов</p>
        {storeLimit > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            Ваш текущий тариф позволяет добавить до {storeLimit} {storeLimit === 1 ? 'магазина' : storeLimit < 5 ? 'магазина' : 'магазинов'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
