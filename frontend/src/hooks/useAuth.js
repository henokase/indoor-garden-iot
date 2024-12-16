import api from "../lib/axios";
import { useMutation } from "@tanstack/react-query";

const useAuth = () => {
    const { mutateAsync: loginMutation, isLoading } = useMutation({
        mutationFn: (password) => {
            return api.post('/auth/login', { password })
        }
    })

    return { loginMutation, isLoading }
}

export default useAuth