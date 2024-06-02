import { useOpenAccount } from "@/features/accounts/hooks/use-open-account";
import { OrderOpenButton } from "./order-open-button";

type Props = {
  account: string | null;
  accountId: string | null;
  orderId: string;
};

export const AccountColumn = ({ account, accountId, orderId }: Props) => {
  const { onOpen: onOpenAccount } = useOpenAccount();

  const onClick = () => {
    accountId && onOpenAccount(accountId);
  };

  if (account && accountId) {
    return (
      <div
        onClick={onClick}
        className="flex items-center cursor-pointer hover:underline"
      >
        {account}
      </div>
    );
  }

  return (
    <>
      <OrderOpenButton id={orderId} />
    </>
  );
};
