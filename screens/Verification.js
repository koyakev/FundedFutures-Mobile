import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, Image, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { db, storage } from '../firebase/dbConnection';
import { addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';

const Verification = ({ navigation, route }) => {
    const { user } = route.params;
    const [random, setRandom] = useState('');
    const [code, setCode] = useState('');

    useEffect(() => {
        console.log(user);
    }, [user])

    useEffect(() => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
        let result = '';
        for (let i = 0; i < 5; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        setRandom(result);

        const sendEmail = async () => {
            const data = {
                Messages: [
                    {
                        From: {
                            Email: 'mklryu@tip.edu.ph',
                            Name: 'FundedFutures'
                        },
                        To: [
                            {
                                Email: user.email,
                                Name: user.firstname,
                            }
                        ],
                        Subject: 'Code verification',
                        HTMLPart: `<p>Please use the code below to verify your account. Thank you</p><h1>${result}</h1>`,
                    }
                ]
            }

            try {
                const response = await axios.post(
                    'https://api.mailjet.com/v3.1/send',
                    data,
                    {
                        auth: {
                            username: '8120cc54befdfb37f071e1ad69063ccb',
                            password: 'c3e1b5d42eedc4d87f36e2bf615d1592',
                        },
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                )
                console.log('Email sent successfully: ', response.data);
            } catch (error) {
                console.error('Error sending email: ', error);
            }
        }
        sendEmail();
    }, [user])

    const verifyCode = async () => {
        if (code == random) {
            Alert.alert('You are now verified');
            navigation.popToTop();

            try {
                const docRef = await addDoc(collection(db, 'students'), {
                    firstname: user.firstname,
                    lastname: user.lastname,
                    school: user.school,
                    course: user.course,
                    studentId: user.studentId,
                    username: user.username,
                    email: user.email,
                    birthday: user.birthday,
                    gender: user.gender,
                    password: user.password,
                    profilePicture: user.filename,
                    isDeactivated: false,
                    dateJoined: new Date().toLocaleDateString(),
                    applications: 0
                })

                const imageRef = ref(storage, `${docRef.id}/studProfilePictures/${user.filename}`);
                await uploadBytes(imageRef, user.blob);

            } catch (error) {
                console.error('Error adding user: ', error);
            }

        } else {
            Alert.alert('You have entered the wrong code');
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image style={styles.logo} source={require('../assets/STUDENT.png')} />
            </View>

            <TextInput
                style={styles.input}
                placeholder='Verification Code'
                placeholderText='#4B4B4B'
                value={code}
                onChangeText={(value) => setCode(value)}
            />

            <Text style={styles.instructionText}>Please check your email to see verification code.</Text>

            <TouchableOpacity>
                <Text style={styles.sendCodeText}>Send Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.verifyButton}
                onPress={verifyCode}
            >
                <Text style={styles.verifyButtonText}>Verify</Text>
            </TouchableOpacity>

        </View>
    )
}

export default Verification;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#555455',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    logoContainer: {
        marginBottom: 30,
        width: 100,
        height: 100,
        backgroundColor: '#3B3B3B',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 200,
        height: 200,
    },
    input: {
        width: '100%',
        height: 50,
        borderRadius: 10,
        backgroundColor: '#FEEFC3',
        paddingHorizontal: 15,
        fontSize: 16,
        marginBottom: 20,
    },
    instructionText: {
        color: '#FEEFC3',
        marginBottom: 10,
        fontSize: 14,
        textAlign: 'center',
    },
    sendCodeText: {
        color: '#FEEFC3',
        marginBottom: 30,
        textDecorationLine: 'underline',
    },
    verifyButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#3B3B3B',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    verifyButtonText: {
        color: '#FEEFC3',
        fontSize: 18
    }
})