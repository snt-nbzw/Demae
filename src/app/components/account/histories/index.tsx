import React from "react";
import { Link, useParams, useHistory } from "react-router-dom"
import "firebase/auth";
import "firebase/functions";
import { List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, Avatar, Container, Divider } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import ImageIcon from "@material-ui/icons/Image";
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { useUser } from "hooks/commerce"
import { useDataSourceListen, useDocumentListen, OrderBy } from "hooks/firestore";
import DataLoading from "components/DataLoading";
import { Paper, Grid, Typography, Box } from "@material-ui/core";
import Order from "models/commerce/Order";
import Provider from "models/commerce/Provider";
import Dayjs from "dayjs"
import Label from "components/Label";
import ActionSheet from "components/ActionSheet"
import { PaymentStatus, DeliveryStatus } from "common/commerce/Types"
import { useMenu } from "components/Menu";
import { useDrawer } from "components/Drawer";
import { useSnackbar } from "components/Snackbar";
import { useProcessing } from "components/Processing";

const DeliveryStatusLabel: { [key in DeliveryStatus]: string } = {
	"none": "NONE",
	"pending": "PENDING",
	"preparing_for_delivery": "TODO",
	"out_for_delivery": "OUT FOR DELIVERY",
	"in_transit": "IN TRANSIT",
	"failed_attempt": "FAILED ATTEMPT",
	"delivered": "DELIVERED",
	"available_for_pickup": "AVAILABLE FOR PICKUP",
	"exception": "EXCEPTION",
	"expired": "EXPIRED"
}

const PaymentStatusLabel: { [key in PaymentStatus]: string } = {
	"none": "NONE",
	"processing": "PROCESSING",
	"succeeded": "SUCCEEDED",
	"payment_failed": "FAILED",
	"canceled": "CANCELED"
}

export default () => {
	const { orderID } = useParams<{ orderID?: string }>()
	return (
		<Container maxWidth="sm">
			<Typography variant="h1" gutterBottom>Order history</Typography>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					{orderID ? <OrderDetail /> : <OrderList />}
				</Grid>
			</Grid>
		</Container>
	)
}

const OrderList = () => {
	const theme = useTheme()
	const [user, isLoading] = useUser()
	const ref = user?.orders.collectionReference
	const [orders, isDataLoading] = useDataSourceListen<Order>(Order, {
		path: ref?.path,
		orderBy: OrderBy("createdAt", "desc"),
		limit: 100
	}, isLoading)

	if (isDataLoading) {
		return (
			<Paper>
				<DataLoading />
			</Paper>
		)
	}

	if (orders.length === 0) {
		return <Box padding={3} display="flex" justifyContent="center" fontWeight={600} fontSize={20}>There are no orders.</Box>
	}

	return (
		<Paper>
			<List style={{
				height: "100%"
			}}>
				{orders.map(data => {
					const orderedDate = Dayjs(data.createdAt.toDate())
					return (
						<ListItem key={data.id} button alignItems="flex-start" component={Link} to={`/account/orders/${data.id}`}>
							<ListItemAvatar>
								<Avatar variant="rounded" src={data.imageURLs()[0]} style={{
									height: theme.spacing(5),
									width: theme.spacing(5)
								}}>
									<ImageIcon />
								</Avatar>
							</ListItemAvatar>
							<ListItemText primary={
								<>
									<Typography variant="subtitle1">
										{data.title}
									</Typography>
									<Typography variant="body2">
										{`ID: ${data.id}`}
									</Typography>
									<Typography variant="caption">
										{orderedDate.format("YYYY-MM-DD HH:mm:ss")}
									</Typography>
									<Box display="flex" paddingY={1}>
										{data.salesMethod === "online" && <Label color="gray" fontSize={12}>{DeliveryStatusLabel[data.deliveryStatus]}</Label>}
										<Label color="gray" fontSize={12}>{PaymentStatusLabel[data.paymentStatus]}</Label>
									</Box>
								</>
							} />
						</ListItem>
					)
				})}
			</List>
		</Paper>
	)
}

const OrderDetail = () => {
	const theme = useTheme()
	const { orderID } = useParams<{ orderID?: string }>()
	const [user] = useUser()
	const ref = user?.orders.collectionReference.doc(orderID)
	const [order, isLoading] = useDocumentListen<Order>(Order, ref)
	const [menuPros, menuOpen] = useMenu()
	const [showDrawer, closeDrawer] = useDrawer()
	const [showSnackbar] = useSnackbar()
	const [setProcessing] = useProcessing()

	if (isLoading || !order) {
		return (
			<Paper>
				<DataLoading />
			</Paper>
		)
	}

	return (
		<>
			<Typography variant="h2" gutterBottom>Order</Typography>
			<Paper style={{
				marginBottom: theme.spacing(2)
			}}>
				<Box padding={2}>
					<Box paddingBottom={2} display="flex" justifyContent="space-between">
						<Box>
							<Typography variant="subtitle1">{order.title}</Typography>
							<Typography variant="body2" color="textSecondary">ORDER ID: {order.id}</Typography>
						</Box>
						<Box>
							<IconButton aria-label="settings" onClick={menuOpen}>
								<MoreVertIcon />
							</IconButton>
							<Menu {...menuPros}>
								{
									order.paymentStatus === "succeeded" ?
										<MenuItem onClick={() => {
											showDrawer(
												<ActionSheet title="Would you like to refund this order?" actions={
													[
														{
															title: "Refund request",
															handler: async () => {
																setProcessing(true)
																const response = await order.refundRequest()
																const { error, result } = response.data
																if (error) {
																	console.error(error)
																	showSnackbar('error', error.message)
																	setProcessing(false)
																	closeDrawer()
																	return
																}
																console.log(result)
																showSnackbar("success", "The order was canceled.")
																setProcessing(false)
																closeDrawer()
															}
														}
													]
												} />
											)
										}}>Refund</MenuItem> :
										<MenuItem onClick={() => {
											showDrawer(
												<ActionSheet title="Would you like to cancel this order?" actions={
													[
														{
															title: "Cancel request",
															handler: async () => {
																setProcessing(true)
																const response = await order.cancel()
																const { error, result } = response.data
																if (error) {
																	console.error(error)
																	showSnackbar('error', error.message)
																	setProcessing(false)
																	closeDrawer()
																	return
																}
																console.log(result)
																showSnackbar("success", "The order was canceled.")
																setProcessing(false)
																closeDrawer()
															}
														}
													]
												} />
											)
										}}>Cancel</MenuItem>
								}

							</Menu>
						</Box>
					</Box>

					<Divider />

					<Box paddingTop={2}>
						<Typography variant="subtitle1" gutterBottom>Items</Typography>
						<Paper>
							<List>
								{order.items.map(data => {
									const image = (data.imageURLs().length > 0) ? data.imageURLs()[0] : undefined
									return (
										<ListItem key={data.skuReference?.path} button component={Link} to={`/providers/${order.providedBy}/products/${data.productReference?.id}/skus/${data.skuReference?.id}`}>
											<ListItemAvatar >
												<Avatar variant="rounded" src={image} style={{
													height: theme.spacing(5),
													width: theme.spacing(5)
												}}>
													<ImageIcon />
												</Avatar>
											</ListItemAvatar>
											<ListItemText primary={
												<>
													<Typography variant="subtitle2">{data.name}</Typography>
													<Typography variant="body2" color="textSecondary">{data.caption}</Typography>
													<Typography variant="body2" color="textSecondary">{data.currency} {data.price.toLocaleString()}</Typography>
												</>
											} secondary={
												<Typography>Qty: {data.quantity.toString()}</Typography>
											} />
										</ListItem>
									)
								})}
							</List>
						</Paper>
						{order.salesMethod === "online" &&
							<Box paddingY={2}>
								<Typography variant="subtitle1" gutterBottom>Shipping Information</Typography>
								<Typography variant="body2" >{order.shipping?.format(["postal_code", "line1", "line2", "city", "state"])}</Typography>
							</Box>
						}
					</Box>

					<Divider />

					<Box paddingTop={2}>
						<Typography variant="subtitle1" gutterBottom>Summary</Typography>
						<Box display="flex" justifyContent="space-between">
							<Typography variant="body1" gutterBottom>Total</Typography>
							<Typography variant="body1" gutterBottom>{order.currency} {order.amount.toLocaleString()}</Typography>
						</Box>
					</Box>
				</Box>
			</Paper>
			<Typography variant="h2" gutterBottom>Shop</Typography>
			<Paper>
				<ProviderInfo order={order} />
			</Paper>
		</>
	)
}

const ProviderInfo = ({ order }: { order: Order }) => {
	const theme = useTheme()
	const history = useHistory()
	const [provider, isLoading] = useDocumentListen<Provider>(Provider, Provider.collectionReference().doc(order.providedBy))

	if (isLoading) {
		return (
			<Paper>
				<DataLoading />
			</Paper>
		)
	}

	if (!provider) {
		return (
			<></>
		)
	}

	return (
		<Box padding={2} onClick={() => history.push(`/providers/${provider.id}`)}>
			<Grid container wrap="nowrap" spacing={2}>
				<Grid item>
					<Avatar variant="rounded" src={provider.coverImageURL()} alt={provider.name} style={{
						height: theme.spacing(8),
						width: theme.spacing(8)
					}}>
						<ImageIcon />
					</Avatar>
				</Grid>
				<Grid item xs zeroMinWidth>
					<Typography variant="subtitle1" gutterBottom>{provider.name}</Typography>
					<Typography variant="body1" color="textSecondary">{provider.caption}</Typography>
					<Divider style={{
						marginTop: theme.spacing(1),
						marginBottom: theme.spacing(1),
					}} />
					<Typography variant="body2" color="textSecondary">{provider.description}</Typography>
				</Grid>
			</Grid>
		</Box>
	)
}
