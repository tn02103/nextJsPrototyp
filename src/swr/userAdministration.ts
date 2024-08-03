import { getUserList } from "@/actions/users/getUsers";
import { User } from "@prisma/client";
import useSWR from "swr";


export const userAdministrationUserList = (initialData?: User[]) => {
    const { data, mutate } = useSWR(
        'admin.user.list',
        () => getUserList(),
        { fallbackData: initialData }
    );
    return {
        userList: data,
        mutate,
    }
}