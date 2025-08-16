import { StyleSheet, Text, Button, View } from 'react-native'
import React from 'react'

const Home = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home</Text>
      <Button title ="Profile" onPress={() => navigation.navigate("Profile", {id:1, name:"LoLu"})} />
    </View>
  )
}

export default Home

const styles = StyleSheet.create({
  container:{
    height:"100%",
    width:"100%",
    justifyContent:"center", 
    alignItems:"center"
  },
  text:{
    fontSize:20, 
    fontWeight:500, 
    marginBottom:10
  }
})