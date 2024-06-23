import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { insertHairSchema } from "@/db/schema";
import { z } from "zod";

type Hair = z.infer<typeof insertHairSchema>;

type Props = {
  hair: Hair[];
  value: string;
  onChange: (value: string | undefined) => void;
  disabled?: boolean;
};

export const HairSelect = ({ hair, value, onChange, disabled }: Props) => {
  return (
    <div className="relative w-full flex-col items-start md:flex">
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          id="model"
          className="items-start [&_[data-description]]:hidden"
        >
          <SelectValue placeholder="Select hair" />
        </SelectTrigger>
        <SelectContent>
          {hair.map((h) => (
            <SelectItem value={h.id} key={h.id}>
              <div className="flex items-start gap-3 text-muted-foreground">
                {/* <Rabbit className="size-5" /> */}
                <div className="grid gap-0.5">
                  <p>{h.upc}</p>
                  <p className="text-xs" data-description>
                    Length: {h.length} Weight in Stock: {h.weightInStock}
                  </p>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
