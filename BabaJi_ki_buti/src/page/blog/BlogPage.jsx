import { useAuth } from "../../auth/AuthContext";
import SubscriptionPage from "../../components/Subscribe";
const BlogPage = () => {
   const { user } = useAuth();
    const userId = user?.id ?? null;
    return(
        <div>
            <SubscriptionPage userId={userId}/>
        </div>
    )
}

export default BlogPage;