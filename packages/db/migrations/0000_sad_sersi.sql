CREATE TABLE `signCategories` (
	`categoryId` text NOT NULL,
	`signId` text NOT NULL,
	FOREIGN KEY (`categoryId`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`signId`) REFERENCES `sign`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `category` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`updatedAt` integer,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `connection` (
	`id` text PRIMARY KEY NOT NULL,
	`providerName` text NOT NULL,
	`providerId` text NOT NULL,
	`updatedAt` integer,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`userId` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `favorite` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`videoId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`videoId`) REFERENCES `video`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `password` (
	`hash` text NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `permissionToRole` (
	`roleId` text NOT NULL,
	`permissionId` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `permission` (
	`id` text PRIMARY KEY NOT NULL,
	`action` text NOT NULL,
	`entity` text NOT NULL,
	`access` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer
);
--> statement-breakpoint
CREATE TABLE `report` (
	`id` text PRIMARY KEY NOT NULL,
	`videoId` text NOT NULL,
	`userId` text NOT NULL,
	`reason` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer
);
--> statement-breakpoint
CREATE TABLE `request` (
	`id` text PRIMARY KEY NOT NULL,
	`term` text NOT NULL,
	`definition` text NOT NULL,
	`example` text NOT NULL,
	`userId` text NOT NULL,
	`updatedAt` integer,
	`approvedOn` integer,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`requestStatus` text NOT NULL,
	`requestType` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `roleToUser` (
	`userId` text NOT NULL,
	`roleId` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `role` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer
);
--> statement-breakpoint
CREATE TABLE `seeded` (
	`id` text PRIMARY KEY NOT NULL,
	`isSeeded` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expirationDate` integer NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `relatedSign` (
	`sign` text NOT NULL,
	`relatedSign` text NOT NULL,
	FOREIGN KEY (`sign`) REFERENCES `sign`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sign` (
	`id` text PRIMARY KEY NOT NULL,
	`example` text NOT NULL,
	`definition` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`updatedAt` integer,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`termId` text NOT NULL,
	FOREIGN KEY (`termId`) REFERENCES `term`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `term` (
	`id` text PRIMARY KEY NOT NULL,
	`word` text NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` integer
);
--> statement-breakpoint
CREATE TABLE `userImage` (
	`id` text PRIMARY KEY NOT NULL,
	`altText` text,
	`contentType` text NOT NULL,
	`blob` blob NOT NULL,
	`updatedAt` integer,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`updatedAt` integer,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`target` text NOT NULL,
	`secret` text NOT NULL,
	`algorithm` text NOT NULL,
	`digits` integer NOT NULL,
	`period` integer NOT NULL,
	`charSet` text NOT NULL,
	`expiresAt` integer,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `video` (
	`id` text PRIMARY KEY NOT NULL,
	`videoId` text NOT NULL,
	`trendingScore` real DEFAULT 0 NOT NULL,
	`signId` text NOT NULL,
	`userId` text NOT NULL,
	`updatedAt` integer,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`voteCount` integer DEFAULT 0 NOT NULL,
	`url` text NOT NULL,
	`approvedOn` integer,
	`status` text NOT NULL,
	FOREIGN KEY (`signId`) REFERENCES `sign`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `vote` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`videoId` text NOT NULL,
	`updatedAt` integer,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`voteTypeId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`videoId`) REFERENCES `video`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `permission_action_entity_access_unique` ON `permission` (`action`,`entity`,`access`);--> statement-breakpoint
CREATE UNIQUE INDEX `term_word_unique` ON `term` (`word`);--> statement-breakpoint
CREATE UNIQUE INDEX `type_target` ON `verification` (`type`,`target`);