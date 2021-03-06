import { Doc, Field, Collection, SubCollection, CollectionReference, firestore, GeoPoint, File } from "@1amageek/ballcap-admin"
import { CurrencyCode } from "../../common/Currency"
import Product, { ProductDraft } from "./Product"
import Order from "./Order"

export type Permission = "read" | "write" | "owner"

export class Role extends Doc {
	@Field permissions: Permission[] = ["read", "write", "owner"]
}

export type SNSProvider = "twitter" | "facebook" | "instagram"

export type Capability = "download" | "instore" | "online" | "pickup"

export class ProviderDraft extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection("commerce/v1/providerDrafts")
	}

	@Field isAvailable: boolean = false
	@Field thumbnailImage?: File
	@Field coverImage?: File
	@Field capabilities: Capability[] = []
	@Field name: string = ""
	@Field caption: string = ""
	@Field description: string = ""
	@Field country: string = "US"
	@Field defaultCurrency: CurrencyCode = "USD"
	@Field email: string = ""
	@Field phone: string = ""
	@Field location?: GeoPoint
	@Field address?: string
	@Field url?: string
	@Field sns?: { [key in SNSProvider]: any }
	@Field metadata?: { [key: string]: any } = {}
}

export default class Provider extends ProviderDraft {

	static collectionReference(): CollectionReference {
		return firestore.collection("commerce/v1/providers")
	}

	@SubCollection productDrafts: Collection<ProductDraft> = new Collection()
	@SubCollection products: Collection<Product> = new Collection()
	@SubCollection orders: Collection<Order> = new Collection()
	@SubCollection operators: Collection<Role> = new Collection()
}
