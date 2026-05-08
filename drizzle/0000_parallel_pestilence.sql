CREATE TABLE `activity` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_slug` text NOT NULL,
	`entity_kind` text NOT NULL,
	`entity_id` text NOT NULL,
	`action` text NOT NULL,
	`payload` text DEFAULT '{}' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_activity_entity` ON `activity` (`entity_kind`,`entity_id`);--> statement-breakpoint
CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`workspace_slug` text NOT NULL,
	`body` text NOT NULL,
	`author` text DEFAULT 'Ethan' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_comments_task` ON `comments` (`task_id`);--> statement-breakpoint
CREATE TABLE `project_sources` (
	`project_slug` text NOT NULL,
	`workspace_slug` text NOT NULL,
	`raw_markdown` text NOT NULL,
	`last_parsed_at` integer,
	`parse_error` text,
	PRIMARY KEY(`project_slug`, `workspace_slug`)
);
--> statement-breakpoint
CREATE INDEX `idx_sources_workspace` ON `project_sources` (`workspace_slug`);--> statement-breakpoint
CREATE TABLE `projects` (
	`workspace_slug` text NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`one_liner` text NOT NULL,
	`accent` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`share_token` text,
	`is_public` integer DEFAULT true NOT NULL,
	PRIMARY KEY(`workspace_slug`, `slug`)
);
--> statement-breakpoint
CREATE TABLE `subtasks` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`workspace_slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'next' NOT NULL,
	`assignee` text DEFAULT 'claude-code' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`completed_at` integer,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_subtasks_task` ON `subtasks` (`task_id`);--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`project_slug` text NOT NULL,
	`workspace_slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`status` text DEFAULT 'next' NOT NULL,
	`phase` text,
	`tier` text,
	`assignee` text DEFAULT 'claude-code' NOT NULL,
	`cycle_label` text,
	`target_date` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`kind` text DEFAULT 'cycle' NOT NULL,
	`category` text,
	`priority` text,
	`blocker_id` text,
	`unblocks` integer,
	`week_heading` text,
	`channel` text,
	`is_launch` integer DEFAULT false NOT NULL,
	`day` text,
	`posting_time` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`completed_at` integer
);
--> statement-breakpoint
CREATE INDEX `idx_tasks_project_status` ON `tasks` (`project_slug`,`status`);--> statement-breakpoint
CREATE INDEX `idx_tasks_assignee` ON `tasks` (`assignee`);--> statement-breakpoint
CREATE INDEX `idx_tasks_phase` ON `tasks` (`phase`);--> statement-breakpoint
CREATE INDEX `idx_tasks_kind` ON `tasks` (`kind`);--> statement-breakpoint
CREATE INDEX `idx_tasks_blocker` ON `tasks` (`blocker_id`);--> statement-breakpoint
CREATE INDEX `idx_tasks_workspace_project` ON `tasks` (`workspace_slug`,`project_slug`);--> statement-breakpoint
CREATE TABLE `workspaces` (
	`slug` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`owner_user_id` text NOT NULL,
	`plan` text DEFAULT 'free' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_workspaces_owner` ON `workspaces` (`owner_user_id`);