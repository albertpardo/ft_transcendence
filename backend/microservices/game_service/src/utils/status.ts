const USER_MANAGEMENT_URL = "http://user_management:9001";

export async function setUserStatus(userId: string, userStatus: string) {
 	  
  const updatedData: {
     userStatus: string;
  } = {
    userStatus: userStatus
  }
  
  try {
    const response = await fetch(`${USER_MANAGEMENT_URL}/api/user/status`, {
      method: "PUT",
      headers: { 
        "x-user-id": userId,
        "Content-Type": "application/json"
      },
      credentials: 'include',
      body: JSON.stringify(updatedData),
    })  ;
    if (!response.ok) {
      console.log("!response.ok -- When put Status : ", updatedData.userStatus);  
	  }
  } catch (err) {
			console.log("Error when change status: ", err);
  }
}
