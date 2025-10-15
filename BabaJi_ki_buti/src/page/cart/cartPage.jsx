import { useAuth } from "../../auth/AuthContext";
import CartPage from "../../components/cart/CartPage"

const cartPage=()=>{
    const { user } = useAuth();
  const userId = user?.id ?? null;
    return(
        <>
            <CartPage userId={userId}/>
        </>
    )
}
export default cartPage;