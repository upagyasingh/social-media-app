import { useMutation, useQueryClient } from "react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const useUpdateUserProfile = () => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useMutation({
		mutationFn: async (formData) => {
			try {
				const res = await fetch(`/api/users/update`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(formData),
				});
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.message || "Something went wrong");
				}
				return data;
			} catch (error) {
				throw new Error(error.message);
			}
		},
		onSuccess: (data) => {
			toast.success("Profile updated successfully");
			Promise.all([
				queryClient.invalidateQueries({ queryKey: ["authUser"] }),
				queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
			]);

			const newUsername = data?.username; 
			console.log(newUsername)
			if (newUsername) {
			  navigate(`/profile/${newUsername}`);
			}
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return { updateProfile, isUpdatingProfile };
};

export default useUpdateUserProfile;