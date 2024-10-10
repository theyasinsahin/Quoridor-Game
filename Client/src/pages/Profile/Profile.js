import { useEffect, useState } from "react";
import { GET_USER_INFOS } from "../../graphql/queries";
import { useQuery } from "@apollo/client";

const Profile = () => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));

    const [user, setUser] = useState({
        name: null,
        email: null,
        country: null,
    });

    const { data, loading, error } = useQuery(GET_USER_INFOS, {
        variables: { userId: loggedInUser.id },
      });
    
    useEffect(() => {
        if(!loading && !error){            
            setUser(() => ({
                name: data.userInfos.name,
                email: data.userInfos.email,
                country: data.userInfos.country,
            }))      

        }else if(error){
            console.log("Hata: ", error);
        }

    
    }, [data, loading, error])


    return (
        <div>
            <h1>User Informations</h1>
            {user.name && 
            <div>
                <h4>{user.name}</h4>
                <h4>{user.email}</h4>
                <h4>{user.country}</h4>
            </div>
            }
        </div>
    )
}

export default Profile;