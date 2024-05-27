import { useOpenTransaction } from "@/features/transactions/hooks/use-open-transaction";

type Props = {
  transaction: string;
  transactionId: string;
};

export const TransactionColumn = ({ transaction, transactionId }: Props) => {
  const { onOpen: onOpenAccount } = useOpenTransaction();

  const onClick = () => {
    onOpenAccount(transactionId);
  };

  return (
    <div
      onClick={onClick}
      className="flex items-center cursor-pointer hover:underline"
    >
      {transaction}
    </div>
  );
};
