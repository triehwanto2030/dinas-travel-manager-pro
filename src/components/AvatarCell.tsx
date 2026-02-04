import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type AvatarCellProps = {
	employeeUsed: any;
	classname: string;
	children?: React.ReactNode;
};

const UserAvatarCell = ({ employeeUsed, classname, children }: AvatarCellProps) => {
	return (
		<>
			<Avatar className={classname}>
				<AvatarImage src={employeeUsed.photo_url} alt={employeeUsed.name} />
				<AvatarFallback className="text-lg">
					{employeeUsed.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
				</AvatarFallback>
			</Avatar>
			{children && <div>{children}</div>}
		</>
	);
};

export default UserAvatarCell;