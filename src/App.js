import React from 'react';
import vkConnect from '@vkontakte/vkui-connect';
import {connect} from 'react-redux';
import {
    ANDROID,
    Avatar,
    Button,
    Cell,
    Checkbox,
    Div,
    FormLayout,
    FormLayoutGroup,
    Group,
    Input,
    IOS,
    Link,
    ListItem,
    Panel,
    PanelHeader,
    platform,
    Radio,
    Select,
    Slider,
    Textarea,
    View
} from '@vkontakte/vkui';

import * as osmSelectors from './store/osm/reducer';
import * as osmActions from './store/osm/actions';

import '@vkontakte/vkui/dist/vkui.css';

class App extends React.Component {
    constructor(props) {
        super(props);

        this.fetchContacts = this.fetchContacts.bind(this);

        const params = new URLSearchParams(window.location.search);

        this.state = {
            activePanel: 'home',
            fetchedUser: null,
            email: '',
            pieces: 1,
            accessDeclined: false,
            address: '',
            baseAddress: '',
            location: null,
            platform: params.get('vk_platform'),
        };
    }

    componentDidMount() {
        vkConnect.subscribe((e) => {
            switch (e.detail.type) {
                case 'VKWebAppGetUserInfoResult':
                    let userInfo = e.detail.data;
                    let geoInfo = '';
                    if (userInfo.country) {
                        geoInfo = userInfo.country.title;
                    }

                    if (userInfo.city) {
                        geoInfo += ', ' + userInfo.city.title;
                    }

                    this.setState({fetchedUser: userInfo, baseAddress: geoInfo, address: geoInfo});
                    break;
                case 'VKWebAppGetEmailResult':
                    this.setState({email: e.detail.data.email});
                    break;
                case 'VKWebAppGetPhoneNumberResult':
                    this.setState({phone: e.detail.data.phone_number});
                    break;
                case 'VKWebAppGetPersonalCardResult':
                    let addressContact = e.detail.data.address;
                    this.setState({
                        phone: e.detail.data.phone,
                        email: e.detail.data.email,
                        address: addressContact.country.name + ', ' + addressContact.city.name + ', ' + addressContact.specified_address
                    });
                    break;

                case 'VKWebAppGeodataResult':
                    let geo = e.detail.data;
                    if (geo.available) {
                        this.props.dispatch(osmActions.fetchLocation(geo.lat, geo.long));
                    }

                    break;
                case 'VKWebAppGetPersonalCardFailed':
                case 'VKWebAppSetViewSettingsFailed': // a iOS's bug
                    this.setState({
                        accessDeclined: true
                    });
                    break;
                default:
                    console.log(e.detail.type);
            }
        });
        vkConnect.send('VKWebAppGetUserInfo', {});
    }

    fetchContacts(type) {
        if (this.state.platform === 'mobile_android' || this.state.platform === 'mobile_iphone') {
            if (!this.state.accessDeclined) {
                connect.send('VKWebAppGetPersonalCard', {"type": ["phone", "email", "address"]});
            }
        } else {
            switch (type) {
                case 'address':
                    if (this.props.location === undefined) {
                        vkConnect.send('VKWebAppGetGeodata', {});
                    }
                    break;

                case 'email':
                    vkConnect.send('VKWebAppGetEmail', {});
                    break;

                case 'phone':
                    vkConnect.send('VKWebAppGetPhoneNumber', {});
                    break;
            }
        }
    }

    render() {
        let fetchedUser = this.state.fetchedUser;
        let email = this.state.email;
        let phone = this.state.phone;
        let address = this.state.address;
        let baseAddress = this.state.baseAddress;
        let location = this.props.location;

        return (
            <View activePanel="main">
                <Panel id="main">
                    <PanelHeader>Order</PanelHeader>
                    <Group title="Order detail">
                        <Cell
                            description={<div><span style={{color: "#000"}}>US 125.3$</span><span> / piece</span></div>}
                            before={<Avatar type="app" size={80}
                                            src="https://i1.proskater.ru/images/b2images/1220/23082018-7644-007_1.jpg"/>}>
                            Gant Apollo Blue
                        </Cell>
                    </Group>

                    <Group title="Pieces">
                        <Div>
                            <Slider
                                top={this.state.pieces}
                                min={1}
                                step={1}
                                max={10}
                                value={Number(this.state.pieces)}
                                onChange={value => this.setState({pieces: value})}
                            />
                        </Div>
                        <Div style={{display: 'flex'}}>
                            <Div style={{color: "#909499", flexGrow: 2}}>Shipping Charges 2$</Div>
                            <Div style={{color: "#909499", flexGrow: 2, textAlign: 'right'}}><span
                                style={{color: "#000"}}>US {this.state.pieces * 2}.00$</span> via ups</Div>
                        </Div>
                    </Group>

                    <Group title="Shipping Address">
                        <FormLayout>
                            <Input top="Name"
                                   defaultValue={fetchedUser ? fetchedUser.first_name + ' ' + fetchedUser.last_name : ''}/>
                            <Input type="email" top="E-mail"
                                   onChange={event => this.setState({email: event.target.value})} onClick={(event) => {
                                if (!event.target.value) {
                                    this.fetchContacts('email');
                                }
                            }} placeholder="you@mail.com" defaultValue={email}/>
                            <Input type="phone" top="Phone number"
                                   onChange={event => this.setState({email: event.target.value})} onClick={(event) => {
                                if (!event.target.value) {
                                    this.fetchContacts('phone');
                                }
                            }} placeholder="+7 (999) 057689" defaultValue={phone}/>

                            <Input type="text" top="Address"
                                   onChange={event => this.setState({address: event.target.value})}
                                   onClick={(event) => {
                                       if (!event.target.value || event.target.value === baseAddress) {
                                           this.fetchContacts('address');
                                       }
                                   }} placeholder="USA, New York, 85 10th Ave"
                                   defaultValue={location ? location.display_name : address}/>
                            <Textarea top="Message to seller"/>
                            <Button size="xl">Pay</Button>
                        </FormLayout>
                    </Group>
                </Panel>
            </View>
        );
    }
}

function mapStateToProps(state) {
    return {
        location: osmSelectors.getGetGeoLocation(state),
    };
}

export default connect(mapStateToProps)(App);
