import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  orderId: string;
  title: string;
};

export const TitleColumn = ({ orderId, title }: Props) => {
  const router = useRouter();

  const onClick = () => {
    router.push(`/orders/${orderId}`);
  };

  return (
    <>
      <Button variant="ghost" onClick={onClick}>
        {title}
      </Button>
    </>
  );
};
