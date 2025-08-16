import { StyleSheet, Button, Text, View } from 'react-native'
import React from 'react'

const Profile = ({navigation, route}) => {
  const { id, name }=route.params
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile</Text>
      <Text style={styles.text}> Id:{id}  Name:{name} </Text>
      <Button title ="Search" onPress={() => navigation.navigate("Search")} />
    </View>
  )
}

export default Profile

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