import { Header } from "@/components/header";
import { SheetProvider } from "@/providers/sheet-provider";

type Props = {
  children: React.ReactNode;
};

const DashboardLayout = ({ children }: Props) => {
  return (
    <>
      <Header />
      <SheetProvider />
      <main className="px-3 lg:px-14">{children}</main>
    </>
  );
};

export default DashboardLayout;
