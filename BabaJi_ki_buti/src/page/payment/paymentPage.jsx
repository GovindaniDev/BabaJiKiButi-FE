import { useAuth } from "../../auth/AuthContext";


const paymentPage=()=>{
    const { user } = useAuth();
  const userId = user?.id ?? null;
    return(
        <>
            <paymentsecton/>
        </>
    )
}
export default PaymentPage;