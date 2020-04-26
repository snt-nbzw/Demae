import React, { useEffect } from 'react'
import { Switch, Route, useHistory } from 'react-router-dom'
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles';
import AppBar from 'components/AppBar'
import TabBar from 'components/TabBar'
import Login from 'components/Login'
import Home from 'components/home'
import Cart from 'components/cart'
import Account from 'components/account'
import Provider from 'components/providers'
import Product from 'components/providers/products'
import Checkout from 'components/checkout'
import Shipping from 'components/checkout/shipping'
import PaymentMethod from 'components/checkout/payment'
import CreateForm from 'components/account/CreateForm'
import { Container, Box, CssBaseline } from '@material-ui/core';


const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		box: {
			minHeight: '100vh',
			paddingBottom: '100px',
		},
		content: {
			flexGrow: 1,
			padding: theme.spacing(2, 0),
		}
	})
);

export default ({ children }: { children: any }) => {
	const history = useHistory()
	useEffect(() => {
		window.scrollTo(0, 0)
	}, [history.location.pathname])
	return (
		<Route path="/" component={Layout} />
	);
}

const Layout = ({ children }: { children: any }) => {
	const classes = useStyles()
	return (
		<Box className={classes.box}>
			<AppBar title={'Demae'} />
			<main className={classes.content}>
				<Container maxWidth='sm'>
					<CssBaseline />
					<App />
				</Container>
			</main>
			<TabBar />
		</Box>
	);
}

const App = () => {
	return (
		<Switch>
			<Route path={`/login`} exact component={Login} />
			<Route path={`/home`} exact component={Home} />
			<Route path={`/cart`} exact component={Cart} />
			<Route path={`/account`} exact component={Account} />
			<Route path={`/account/new`} exact component={CreateForm} />
			<Route path={`/providers`} exact component={Provider} />
			<Route path={`/providers/:providerID`} exact component={Provider} />
			<Route path={`/providers/:providerID/products`} exact component={Product} />
			<Route path={`/providers/:providerID/products/:productID`} exact component={Product} />
			<Route path={`/checkout/shipping/:shippingID`} exact component={Shipping} />
			<Route path={`/checkout/shipping`} exact component={Shipping} />
			<Route path={`/checkout`} exact component={Checkout} />
			<Route path={`/checkout/:providerID`} exact component={Checkout} />
			<Route path={`/checkout/paymentMethod/:paymentMethodID`} exact component={PaymentMethod} />
			<Route path={`/checkout/paymentMethod`} exact component={PaymentMethod} />
		</Switch>
	)
}
