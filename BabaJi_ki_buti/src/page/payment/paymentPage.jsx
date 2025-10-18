// src/page/payment/PaymentPage.jsx
import PaymentSection from "../../components/payment/paymentsection";
import { useMe } from "../../auth/user/useMe";

export default function PaymentPage() {
  const { me, loading } = useMe();

  if (loading) return <div className="min-h-screen bg-[#faeade] p-6">Loading…</div>;
  if (!me) return <div className="min-h-screen bg-[#faeade] p-6">Please login to continue.</div>;

  return <PaymentSection userId={me.id} />;
}
