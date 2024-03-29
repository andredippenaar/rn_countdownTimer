import * as React from 'react';
import {
  Vibration,
  StatusBar,
  TextInput,
  Dimensions,
  Animated,
  TouchableOpacity,
  View,
  Image,
  Text,
  StyleSheet,
} from 'react-native';
const { width, height } = Dimensions.get('window');
const colors = {
  blue: '#211551',
  red: '#ff003c',
  text: '#ffffff',
  green: '#90EE90'
};

const timers = [...Array(13).keys()].map((i) => (i === 0 ? 1 : i * 5));
const ITEM_SIZE = width * 0.38;
const ITEM_SPACING = (width - ITEM_SIZE) / 2;

export default function App() {
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const [duration, setDuration] = React.useState(timers[0]);
  const inputRef = React.useRef();
  const timerAnimation = React.useRef(new Animated.Value(height)).current;
  const recoveryAnimation = React.useRef(new Animated.Value(height)).current;
  const textInputAnimation = React.useRef(new Animated.Value(timers[0])).current;
  const buttonAnimation = React.useRef(new Animated.Value(0)).current;
  const recoveryText = React.useRef(new Animated.Value(0)).current;
  

  React.useEffect(() => {
    const listener = textInputAnimation.addListener(({value}) => {
      inputRef?.current?.setNativeProps({
        text: Math.ceil(value).toString()
      })
    })

    return () => {
      textInputAnimation.removeListener(listener)
      textInputAnimation.removeAllListeners();
    }
  })

  const animation = React.useCallback(() => {
    textInputAnimation.setValue(duration);
    Animated.sequence([
      Animated.timing(buttonAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(timerAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.parallel([
        Animated.timing(textInputAnimation, {
          toValue: 0,
          duration: duration * 1000,
          useNativeDriver: true
        }),
        Animated.timing(timerAnimation, {
          toValue: height,
          duration: duration * 1000,
          useNativeDriver: true
        })
      ]),
      
      
      Animated.delay(400)
    ]).start(() => {
      Vibration.cancel();
      Vibration.vibrate();
      textInputAnimation.setValue(duration/4);
      recoveryText.setValue(1);
      Animated.sequence([
        Animated.timing(recoveryAnimation, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true
        }),
        Animated.parallel([
          Animated.timing(textInputAnimation, {
            toValue: 0,
            duration: (duration / 3) * 1000,
            useNativeDriver: true
          }),
          Animated.timing(recoveryAnimation, {
            toValue: height,
            duration: (duration / 3) * 1000,
            useNativeDriver: true
          }),
        ]),
        
        Animated.delay(400)
      ]).start(() => {
        recoveryText.setValue(0);
        textInputAnimation.setValue(duration);
      Animated.timing(buttonAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start()
      })
      
      
    })
  }, [duration])
  
  

  const opacity = buttonAnimation.interpolate({
    inputRange: [0,1],
    outputRange: [1,0]
  })

  const translateY = buttonAnimation.interpolate({
    inputRange: [0,1],
    outputRange: [0,200]
  })

  const textOpacity = buttonAnimation.interpolate({
    inputRange: [0,1],
    outputRange: [0,1]
  })


  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Animated.View style={[StyleSheet.absoluteFillObject, {
        height, 
        width, 
        backgroundColor: colors.red,
        transform: [{
          translateY: timerAnimation
        }]
      }
      ]}>

      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFillObject, {
        height, 
        width, 
        backgroundColor: colors.green,
        transform: [{
          translateY: recoveryAnimation
        }]
      }
      ]}>

      </Animated.View>
      <Image source={require('./assets/F45.png')} resizeMode='contain' style={{width: width / 2, top: -100, justifyContent: "center", alignSelf: "center"}} />
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingBottom: 100,
            opacity,
            transform: [{
              translateY
            }]
          },
        ]}>
        <TouchableOpacity
          onPress={animation}>
          <View
            style={styles.roundButton}
          />
        </TouchableOpacity>
      </Animated.View>
      <View
        style={{
          position: 'absolute',
          top: height / 2.2,
          left: 0,
          right: 0,
          flex: 1,
        }}>
          <Animated.View style={{
            position: 'absolute',
            top: -20,
            width: ITEM_SIZE,
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "center",
            opacity: recoveryText
          }}>
           
            <Text 
            style={{
              color: colors.text, 
              fontSize: 30,
              fontFamily: 'Menlo',
              color: colors.text,
              fontWeight: '900',}}>
                RECOVERY
              </Text>
          </Animated.View>
          <Animated.View style={{
            position: 'absolute',
            width: ITEM_SIZE,
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "center",
            opacity: textOpacity, 
          }}>
           
            <TextInput 
              ref={inputRef}
              style={styles.text}
              defaultValue={duration.toString()}
            />
          </Animated.View>
          <Animated.FlatList 
            data={timers}
            keyExtractor={item => item.toString()}
            horizontal
            onScroll={Animated.event(
              [{nativeEvent: {contentOffset: {x: scrollX}}}],
              {useNativeDriver: true}
            )}
            bounces={false}
            onMomentumScrollEnd={ev => {
              const index = Math.round(ev.nativeEvent.contentOffset.x / ITEM_SIZE)
              setDuration(timers[index]);
            }}
            snapToInterval={ITEM_SIZE}
            decelerationRate='fast'
            contentContainerStyle={{
              paddingHorizontal: ITEM_SPACING
            }}
            style={{flexGrow: 0, opacity}}
            showsHorizontalScrollIndicator={false}
            renderItem={({item, index}) => {
              const inputRange = [
                (index - 1) * ITEM_SIZE,
                index * ITEM_SIZE,
                (index + 1) * ITEM_SIZE
              ]

              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [.4, 1, .4]
              })

              const scale = scrollX.interpolate({
                inputRange,
                outputRange: [.7, 1, .7]
              })

              return <View style={{width: ITEM_SIZE, justifyContent: "center", alignItems: "center"}}>
                <Animated.Text style={[styles.text, {
                  opacity,
                  transform: [{
                    scale
                  }]
                  }]}>
                  {item}
                </Animated.Text>
              </View>
            }}
          />
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.blue,
  },
  roundButton: {
    width: 80,
    height: 80,
    borderRadius: 80,
    backgroundColor: colors.red,
  },
  text: {
    fontSize: ITEM_SIZE * 0.8,
    fontFamily: 'Menlo',
    color: colors.text,
    fontWeight: '900',
  }
});