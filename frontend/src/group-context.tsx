import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { fetchGroup, Group, HttpPromiseError } from './api/group';

export type GroupContextProps = {
	group: Group | undefined;
	isLoadingGroup: boolean;
	isErrorGroup: HttpPromiseError | unknown;
};

// fetch group and set it in global context
export const GroupContext = React.createContext<GroupContextProps>({
	group: undefined,
	isLoadingGroup: false,
	isErrorGroup: null,
	// isErrorGroup: HttpPromiseError | unknown;
});

interface GroupContextProviderProps {
	children: React.ReactNode;
}
export const GroupContextProvider = ({
	children,
}: GroupContextProviderProps) => {
	const {
		data: group,
		isLoading: isLoadingGroup,
		isError: isErrorGroup,
	} = useQuery({
		queryKey: ['fetchGroup'],
		queryFn: fetchGroup,
	});

	return (
		<GroupContext.Provider
			value={{
				group,
				isLoadingGroup,
				isErrorGroup,
			}}
		>
			{children}
		</GroupContext.Provider>
	);
};

export const useGroupContext = () => React.useContext(GroupContext);

// export function useAPI() {
// 	const context = useContext(APIContext);
// 	if (context === undefined) {
// 		throw new Error('Context must be used within a Provider');
// 	}
// 	return context;
// }
