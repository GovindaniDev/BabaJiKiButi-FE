import { useAuth } from "../../auth/AuthContext";
import CartPage from "../../components/cart/CartPage"

const CartSection=()=>{
    const { user } = useAuth();
  const userId = user?.id ?? null;
    return(
        <>
            <CartPage userId={userId}/>
        </>
    )
}
export default CartSection;