import { COLORS } from "$constants/colors";
import { DEVICE_HEIGHT, DEVICE_WIDTH } from "$constants/dimensions";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    img : {
        width : '100%',
        height : '100%',
        resizeMode : 'contain'
    },
    imgContainer : {
        width : DEVICE_WIDTH * 0.6,
        height : DEVICE_HEIGHT * 0.2,
        alignItems : 'center',
        justifyContent : 'center',
        alignSelf : 'center',
        marginVertical : 40,
    },

    witchContainer : {
        position : 'absolute',
        top : '70%',
        left : '24%',
    },
    witch : {
        height : 250,
        width : 250,
        transform : [{rotate:'25deg'}]
    }
});