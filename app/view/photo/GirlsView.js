import React, {Component} from "react";
import {
    Image,
    FlatList,
    StyleSheet,
    TouchableHighlight,
    TouchableOpacity,
    DeviceEventEmitter
} from "react-native";
import {getCategoryData} from "../../http/api_gank";
import {Actions} from 'react-native-router-flux';
import {isIphoneX, mainColor, screenWidth} from "../../configs";
import {createAppContainer, createStackNavigator} from "react-navigation";
import WaitLoadingView from "../component/WaitLoadingView";
import ErrorView from "../component/ErrorView";

const marginBottom = isIphoneX() ? 20 : 0;

class GirlsView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            isRefreshing: false,
            //网络请求状态
            error: false,
            errorInfo: "",
            dataArray: [],
            page: 1,
            column: 2,
        };
    }

    static navigationOptions = ({navigation}) => ({
        title: `妹纸`,
        headerTintColor: "white",
        headerStyle: {backgroundColor: mainColor},
        headerRight: (
            <TouchableOpacity
                style={{paddingStart: 10, paddingEnd: 10}}
                onPress={() => {
                    DeviceEventEmitter.emit('rightNavBarAction');
                }}>
                <Image
                    style={{height: 25, width: 25,}}
                    source={require('../../image/switch.png')}
                />
            </TouchableOpacity>)
    });

    componentWillMount() {
        DeviceEventEmitter.addListener('rightNavBarAction', this.setColumn.bind(this));
    }


    componentWillUnmount() {
        DeviceEventEmitter.removeAllListeners('rightNavBarAction');
    }

    setColumn() {
        let c = this.state.column === 2 ? 1 : 2;
        this.setState({
            column: c,
        });
    }

    //网络请求
    fetchData(): Function {
        getCategoryData("福利", 1)
            .then((list) => {
                this.setState({
                    dataArray: list.results,
                    isLoading: false,
                    isRefreshing: false,
                });
            })
            .catch((error) => {
                this.setState({
                    error: true,
                    errorInfo: error
                })
            });
    }

    componentDidMount() {
        //请求数据
        this.fetchData();
    }

    renderData() {
        return (
            <FlatList
                style={{marginBottom: marginBottom,}}
                data={this.state.dataArray}
                renderItem={({item}) => this.renderItemView(item)}
                key={(this.state.column === 2 ? 'vShow' : 'hShow')}
                keyExtractor={(item, index) => index.toString()}
                onRefresh={this._onFresh.bind(this)}
                refreshing={this.state.isRefreshing}
                numColumns={this.state.column}
                getItemLayout={(data, index) => (
                    this.state.column === 2
                        ? {length: screenWidth * 0.60, offset: screenWidth * 0.60 * index, index}
                        : {length: screenWidth * 0.8, offset: screenWidth * 0.8 * index, index}
                )}
            />
        );
    }

    _onFresh() {
        this.fetchData();
    }

    render() {
        //第一次加载等待的view
        if (this.state.isLoading && !this.state.error) {
            return <WaitLoadingView/>;
        } else if (this.state.error) {
            return <ErrorView error={this.state.errorInfo}/>;
        }
        //加载数据
        return this.renderData();
    }

    renderItemView(item) {
        let isDouble = this.state.column === 2;
        let w = isDouble ? screenWidth * 0.5 - 7 : screenWidth - 7;
        let h = isDouble ? screenWidth * 0.60 - 7 : screenWidth * 0.8 - 7;
        let style = isDouble ? styles.itemPadding : styles.itemPadding1;
        return (
            <TouchableHighlight
                style={style}
                underlayColor='transparent'
                onPress={() =>
                    Actions.photo({"url": item.url, "title": item.desc})
                }>
                <Image source={{uri: item.url}} style={{height: h, width: w}}/>
            </TouchableHighlight>
        );
    }
}

const styles = StyleSheet.create({
    itemPadding: {
        padding: 3.5,
        height: screenWidth * 0.60,
        width: screenWidth / 2,
    },
    itemPadding1: {
        padding: 3.5,
        height: screenWidth * 0.8,
        width: screenWidth,
    }
});


const RootStack = createStackNavigator(
    {
        photo: {
            screen: GirlsView,
        },
    },
    {
        initialRouteName: 'photo',
    }
);

const AppContainer = createAppContainer(RootStack);

export default class GirlsTab extends React.Component {
    render() {
        return <AppContainer/>;
    }
}