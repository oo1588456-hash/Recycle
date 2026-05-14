import { SellerListingWizard } from "@/components/seller/SellerListingWizard";

export default function SellerEditProductPage({ params }: { params: { id: string } }) {
  return <SellerListingWizard productId={Number(params.id)} />;
}
