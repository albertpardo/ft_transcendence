const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function setUserStatus(userStatus: string) {
  const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
  const authToken : string = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  const authstringheader : string = "Bearer " + authToken;
 	  
  const updatedData: {
     userStatus: string;
  } = {
    userStatus: userStatus
  }
  
  try {
    const reponse = await fetch(`${API_BASE_URL}/api/status`, {
      method: "PUT",
      headers: { 
        "Use-me-to-authorize": authstringheader,
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
