import { Router } from "express";
import * as WikiController from "../controller/Wiki";
import * as ContactController from "../controller/Contact";
import { downloadFile, requireTenantPermission, uploader, validateRequestSchema } from "@eduinteractive/uvc-common";
import { isWikiAuthor } from "../middlewares/isAuthor";
import { createWikiChain, createWikiSectionChain, deleteWikiChain, deleteWikiSectionChain, getWikiChain, getWikiSectionChain, updateWikiChain, updateWikiSectionChain } from "../controller/Wiki.validate";
import { createContactChain, createContactGroupChain, createMultipleContactsChain, deleteContactChain, deleteContactGroupChain, getContactGroupChain, updateContactChain, updateContactGroupChain } from "../controller/Contact.validate";

const TenantRouter = Router({ mergeParams: true });

// Wiki Routes
TenantRouter.get("/wiki", WikiController.getWikis) // Get all Wikis
TenantRouter.get("/wiki/:wikiId", getWikiChain(), validateRequestSchema, WikiController.getWiki) // Get single Wiki
TenantRouter.post("/wiki", requireTenantPermission('knowledge:create', false), createWikiChain(), validateRequestSchema, WikiController.createWiki) // Create Wiki
TenantRouter.put("/wiki/:wikiId", requireTenantPermission('knowledge:edit', true), updateWikiChain(), validateRequestSchema, isWikiAuthor, WikiController.updateWiki) // Update Wiki
TenantRouter.delete("/wiki/:wikiId", requireTenantPermission('knowledge:delete', true), deleteWikiChain(), validateRequestSchema, isWikiAuthor, WikiController.deleteWiki) // Delete Wiki

// Wiki Section Routes
TenantRouter.post("/wiki/:wikiId/section", requireTenantPermission('knowledge:edit', true), isWikiAuthor, createWikiSectionChain(), validateRequestSchema, WikiController.createWikiSection) // Get all Sections
TenantRouter.get("/wiki/:wikiId/section/:sectionId", getWikiSectionChain(), validateRequestSchema, WikiController.getWikiSection) // Get single Section
TenantRouter.put("/wiki/:wikiId/section/:sectionId", requireTenantPermission('knowledge:edit', true), isWikiAuthor, uploader.array("newUploads", 5), updateWikiSectionChain(), validateRequestSchema, WikiController.updateWikiSection) // Update Section
TenantRouter.delete("/wiki/:wikiId/section/:sectionId", requireTenantPermission('knowledge:edit', true), isWikiAuthor, deleteWikiSectionChain(), validateRequestSchema, WikiController.deleteWikiSection) // Delete Section
TenantRouter.get("/wiki/:wikiId/section/:sectionId/download/:key", downloadFile) // Download Material

// ContactGroup Routes
TenantRouter.get("/contactgroup", ContactController.getContactGroups) // Get all ContactGroups
TenantRouter.get("/contactgroup/:contactGroupId", getContactGroupChain(), validateRequestSchema, ContactController.getContactGroup) // Get single ContactGroup
TenantRouter.post("/contactgroup", requireTenantPermission('knowledge:create', false), createContactGroupChain(), validateRequestSchema, ContactController.createContactGroup) // Create ContactGroup
TenantRouter.put("/contactgroup/:contactGroupId", requireTenantPermission('knowledge:edit', false), updateContactGroupChain(), validateRequestSchema, ContactController.updateContactGroup) // Update ContactGroup
TenantRouter.delete("/contactgroup/:contactGroupId", requireTenantPermission('knowledge:delete', false), deleteContactGroupChain(), validateRequestSchema, ContactController.deleteContactGroup) // Delete ContactGroup

// Contact Routes
TenantRouter.post("/contact", requireTenantPermission('knowledge:edit', false), createContactChain(), validateRequestSchema, ContactController.createContact) // Create Contact
TenantRouter.post("/contact/bulk", requireTenantPermission('knowledge:edit', false), createMultipleContactsChain(), validateRequestSchema, ContactController.createMultipleContacts) // Get single Contact
TenantRouter.put("/contact/:contactId", requireTenantPermission('knowledge:edit', false), updateContactChain(), validateRequestSchema, ContactController.updateContact) // Update Contact
TenantRouter.delete("/contact/:contactId", requireTenantPermission('knowledge:edit', false), deleteContactChain(), validateRequestSchema, ContactController.deleteContact) // Delete Contact


export default TenantRouter;