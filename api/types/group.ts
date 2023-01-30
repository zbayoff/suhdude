export interface Group {
	id: string;
	group_id: string;
	name: string;
	phone_number: string;
	type: string;
	description: string;
	image_url: string;
	creator_user_id: string;
	created_at: number;
	updated_at: number;
	muted_until: number;
	office_mode: boolean;
	audio_message_disabled: boolean;
	messages: {
		count: number;
		last_message_id: string;
		last_message_created_at: number;
		preview: {
			nickname: string;
			text: string;
			image_url: string;
			attachments: [];
		};
	};
	max_members: number;
	theme_name: string;
	like_icon: {
		type: string;
		pack_id: number;
		pack_index: number;
	};
	requires_approval: boolean;
	show_join_question: boolean;
	join_question: null;
	message_deletion_period: number;
	message_deletion_mode: string[];
	children_count: number;
	share_url: string;
	share_qr_code_url: string;
	directories: [];
	members: [
		{
			user_id: string;
			nickname: string;
			image_url: string;
			id: string;
			muted: boolean;
			autokicked: boolean;
			roles: string[];
			name: string;
		}
	];
	members_count: number;
	locations: [];
	visibility: string;
	category_ids: null;
}