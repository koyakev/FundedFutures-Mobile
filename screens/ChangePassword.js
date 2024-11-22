import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image, ActivityIndicator, StatusBar } from 'react-native';
import axios from 'axios';
import { updateDoc, getDocs, doc, query, collection, where, addDoc } from 'firebase/firestore';
import { db } from '../firebase/dbConnection';

export default function ChangePassword({ navigation, route }) {
    const { email } = route.params;
    const [id, setId] = useState('');
    const [random, setRandom] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [cpassword, setCPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {

            const userDoc = await getDocs(query(collection(db, 'students'), where('email', '==', email)));
            userDoc.forEach((doc) => {
                setId(doc.id);
            })
        }

        fetchUser();
    })

    useEffect(() => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
        let result = '';
        for (let i = 0; i < 5; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        setRandom(result);
        console.log(result);

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
                                Email: email,
                                Name: 'User',
                            }
                        ],
                        Subject: 'Change Password Code Verification',
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
    }, [email]);

    const resendEmail = async () => {
        const data = {
            Messages: [
                {
                    From: {
                        Email: 'mklryu@tip.edu.ph',
                        Name: 'FundedFutures'
                    },
                    To: [
                        {
                            Email: email,
                            Name: 'User',
                        }
                    ],
                    Subject: 'Change Password Code Verification',
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

    const checkPassword = (insertedPassword) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&,])[A-Za-z\d@$!%*?&,]{8,}$/;
        return passwordRegex.test(insertedPassword);
    }

    const checkCode = async () => {
        setLoading(true);
        const passwordValid = checkPassword(password);

        if (code != random) {
            Alert.alert('Verification code does not match');
        } else if (!passwordValid) {
            Alert.alert('Password invalid');
        } else if (password != cpassword) {
            Alert.alert('Passwords do not match');
        } else {
            Alert.alert('Password Changed');

            try {
                await updateDoc(doc(db, 'students', id), { password: password });

                await addDoc(collection(db, 'logs'), {
                    activity: 'Changed Password',
                    userId: id,
                    timestamp: new Date(),
                });
                navigation.popToTop();
            } catch (error) {
                console.error("Error changing password: ", error);
            }
        }
    }

    return (
        <View style={styles.container}>

            <StatusBar barStyle="light-content" backgroundColor="#4D4D4D" />

            <View style={styles.logoContainer}>
                <Image source={require('../assets/STUDENT.png')} style={styles.logo} />
            </View>

            <TextInput
                style={styles.input}
                placeholder='Enter Verification Code'
                placeholderTextColor='#4B4B4B'
                value={code}
                onChangeText={(value) => setCode(value)}
            />

            <Text style={styles.instructionText}>Please check your email to see verification code.</Text>

            <TouchableOpacity
                onPress={resendEmail}
            >
                <Text style={styles.sendCodeText}>Send Code</Text>
            </TouchableOpacity>

            <TextInput
                style={styles.input}
                placeholder='Enter New Password'
                value={password}
                onChangeText={(value) => setPassword(value)}
            />
            <TextInput
                style={styles.input}
                placeholder='Confirm New Password'
                value={cpassword}
                onChangeText={(value) => setCPassword(value)}
            />

            <View style={styles.passwordRequirements}>
                <Text style={styles.requirementText}>* One lowercase character</Text>
                <Text style={styles.requirementText}>* One uppercase character</Text>
                <Text style={styles.requirementText}>* One number</Text>
                <Text style={styles.requirementText}>* One special character</Text>
            </View>

            <View style={styles.changePasswordButton}>
                {!loading ? (
                    <TouchableOpacity
                        onPress={checkCode}
                    >
                        <Text style={styles.changePasswordButtonText}>Change Password</Text>
                    </TouchableOpacity>

                ) : (
                    <ActivityIndicator
                    />
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#555455'
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
    passwordRequirements: {
        width: '100%',
        marginBottom: 30,
    },
    requirementText: {
        color: '#FEEFC3',
        fontSize: 14,
        marginBottom: 5,
    },
    changePasswordButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#3B3B3B',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    changePasswordButtonText: {
        color: '#FEEFC3',
        fontSize: 18
    }
})