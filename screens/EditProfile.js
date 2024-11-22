import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, TextInput, Alert, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AntDesign from '@expo/vector-icons/AntDesign';
import { SelectList } from 'react-native-dropdown-select-list';
import axios from 'axios';

import { db  } from '../firebase/dbConnection';

import { collection, updateDoc, getDocs, query, doc, where, getDoc, addDoc } from 'firebase/firestore';

export default function EditProfile({ navigation, route }) {
    const { id } = route.params;
    const [schools, setSchools] = useState(null);

    const [user, setUser] = useState([]);
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [school, setSchool] = useState('');
    const [program, setProgram] = useState('');
    const [studentId, setStudentId] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [date, setDate] = useState(new Date());
    const [show, setShow] = useState(false);
    const [gender, setGender] = useState('');
    const [loading, setLoading] = useState(false);
    const [hidden, setHidden] = useState(true);
    const [hiddenC, setHiddenC] = useState(true);
    const [contact, setContact] = useState('');

    const [visible, setVisible] = useState(false);
    const [random, setRandom] = useState('');
    const [code, setCode] = useState('');

    const sendEmail = async () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
        let result = '';
        for (let i = 0; i < 5; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        setRandom(result);

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

    useEffect(() => {
        const fetchSchools = async () => {
            const schoolsQuery = await getDoc(doc(db, 'system', 'partnerSchools'));
            setSchools(schoolsQuery.data());
        }
        fetchSchools();
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userDoc = await getDoc(doc(db, 'students', id));
                setUser(userDoc.data());
            } catch (error) {
                console.error('Error fetching data: ', error)
            }
        }

        fetchData();
    }, [id]);

    useEffect(() => {
        console.log(user);
        setFirstname(user.firstname);
        setLastname(user.lastname);
        setSchool(user.school);
        setProgram(user.program);
        setStudentId(user.studentId);
        setUsername(user.username);
        setDate(new Date());
        setGender(user.gender);
        setPassword('');
        setConfirmPass('');
        setContact(user.contact);
    }, [user])

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setDate(currentDate);
        setShow(false);
    }

    const checkPassword = (insertedPassword) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&,])[A-Za-z\d@$!%*?&,]{8,}$/;
        return passwordRegex.test(insertedPassword);
    }

    const updateStudent = async () => {
        setLoading(true);
        const passwordValid = checkPassword(password);

        console.log(passwordValid);

        if (firstname == '' || lastname == '' || school == '' || contact == '' || program == '' || studentId == '' || username == '' || gender == '' || password == '') {
            Alert.alert('Please fill in necessary information');
            setLoading(false);

        } else if (!passwordValid) {
            Alert.alert('Password invalid');
            setLoading(false);

        } else if (password != confirmPass) {
            Alert.alert('Passwords do not match');
            setLoading(false);

        } else {
            try {
                // const docRef = await addDoc(collection(db, 'students'), {
                //     firstname: firstname,
                //     lastname: lastname,
                //     school: school,
                //     course: program,
                //     studentId: studentId,
                //     username: username,
                //     email: email,
                //     birthday: date.toLocaleDateString(),
                //     gender: gender,
                //     password: password
                // });
                setFirstname('');
                setLastname('');
                setSchool('');
                setProgram('');
                setStudentId('');
                setUsername('');
                setDate(new Date());
                setGender('');
                setPassword('');
                setConfirmPass('');
                setContact('');

                await updateDoc(doc(db, 'students', id), {
                    firstname: firstname,
                    lastname: lastname,
                    school: school,
                    course: program,
                    contact: contact,
                    studentId: studentId,
                    username: username,
                    gender: gender,
                    birthday: date.toLocaleDateString(),
                    password: password,
                });

                const userlog = await addDoc(collection(db, 'logs'), {
                    activity: 'Updated user profile',
                    userId: id,
                    timestamp: new Date(),
                });

                setVisible(false);

            } catch (e) {
                console.error('Error: ', e)
            }
        }
    }

    const verification = () => {
        setVisible(true);
        sendEmail();
    }

    const verify = () => {
        if (code == random) {
            updateStudent();
            navigation.navigate('Profile', { id: id });
        } else {
            Alert.alert('Email Verification code does not match');
        }
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#4D4D4D" />

            {user && (
                <>
                    {schools ? (
                        <ScrollView>
                            <View style={styles.header}>
                                <Pressable
                                    onPress={() => navigation.goBack()}
                                >
                                    <AntDesign name="arrowleft" size={50} color="#FADEAD" />
                                </Pressable>
                                <Text style={styles.label}>Update Profile</Text>
                            </View>
                            <View style={styles.form}>
                                <Text style={[styles.label, { fontSize: 20, marginBottom: 20 }]}>Account Information</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="First Name"
                                    value={firstname}
                                    onChangeText={value => setFirstname(value)}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Last Name"
                                    value={lastname}
                                    onChangeText={value => setLastname(value)}
                                />

                                <View>
                                    <Text style={[styles.label, { fontSize: 16, marginBottom: 5 }]}>Select School: </Text>
                                    <SelectList
                                        setSelected={(value) => setSchool(value)}
                                        data={schools.schools}
                                        boxStyles={[styles.input, { marginBottom: 0 }]}
                                    />
                                </View>

                                <View>
                                    <Text style={[styles.label, { fontSize: 16, marginBottom: 5, marginTop: 20 }]}>Select Course: </Text>
                                    <SelectList
                                        setSelected={(value) => setProgram(value)}
                                        data={schools.courses}
                                        boxStyles={[styles.input, { marginBottom: 0 }]}
                                    />
                                </View>

                                <TextInput
                                    style={[styles.input, { marginTop: 20 }]}
                                    placeholder="Student ID"
                                    value={studentId}
                                    onChangeText={value => setStudentId(value)}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Username"
                                    value={username}
                                    onChangeText={value => setUsername(value)}
                                />

                                <Text style={[styles.label, { fontSize: 16, marginBottom: 10, color: '#B7A92A' }]}>* Must be a valid email address</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Contact Number"
                                    value={contact}
                                    onChangeText={value => setContact(value)}
                                />
                                <View style={styles.horizontal}>
                                    <View>
                                        <Text style={[styles.label, { fontSize: 16, marginBottom: 5 }]}>Birthday:</Text>
                                        <Pressable
                                            onPress={() => setShow(true)}
                                            style={styles.birthday}
                                        >
                                            <Text>{date.toDateString()}</Text>
                                        </Pressable>
                                        {show && (
                                            <DateTimePicker
                                                value={date}
                                                mode="date"
                                                display="default"
                                                onChange={onChange}
                                            />
                                        )}
                                    </View>
                                    <View>
                                        <Text style={[styles.label, { fontSize: 16, marginBottom: 5 }]}>Gender:</Text>
                                        <SelectList
                                            setSelected={(value) => setGender(value)}
                                            data={[
                                                { value: 'Male' },
                                                { value: 'Female' },
                                                { value: 'Prefer not to say' }
                                            ]}
                                            save='value'
                                            boxStyles={styles.gender}
                                        />
                                    </View>
                                </View>
                                <View style={[styles.input, { flexDirection: 'row', justifyContent: 'space-between' }]}>
                                    <TextInput
                                        placeholder="Password"
                                        style={{ flex: 1 }}
                                        value={password}
                                        onChangeText={(value) => setPassword(value)}
                                        secureTextEntry={hidden}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setHidden(!hidden)}
                                    >
                                        <AntDesign name="eye" size={24} color="#333333" />
                                    </TouchableOpacity>
                                </View>
                                <View style={[styles.input, { flexDirection: 'row', justifyContent: 'space-between' }]}>
                                    <TextInput
                                        placeholder="Confirm Password"
                                        style={{ flex: 1 }}
                                        value={confirmPass}
                                        onChangeText={(value) => setConfirmPass(value)}
                                        secureTextEntry={hiddenC}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setHiddenC(!hiddenC)}
                                    >
                                        <AntDesign name="eye" size={24} color="#333333" />
                                    </TouchableOpacity>
                                </View>
                                <Text
                                    style={[styles.label, { fontSize: 16, color: '#B7A92A' }]}
                                >* One lowercased character{"\n"}* One uppercased character{"\n"}* One number{"\n"}* One special character</Text>
                                {!loading ? (
                                    <Pressable style={styles.continue} onPress={verification}>
                                        <Text style={styles.continueText}>Update Profile</Text>
                                    </Pressable>

                                ) : (
                                    <View style={styles.continue}>
                                        <ActivityIndicator
                                            size="small"
                                            color="#FADEAD"
                                        />
                                    </View>
                                )}
                            </View>
                        </ScrollView>
                    ) : (
                        <View style={styles.loading}>
                            <ActivityIndicator
                                size="large"
                                color="#F7D66A"
                            />
                        </View>
                    )}
                </>
            )}


            <Modal
                animationType="slide"
                transparent={true}
                visible={visible}
                onRequestClose={() => setVisible(false)}
            >
                <View style={styles.verificationModalBackground}>
                    <View style={styles.verificationModal}>
                        <Text style={styles.codeText}>A verification code has been sent to your email.</Text>
                        <TextInput
                            style={styles.codeInput}
                            placeholder='XXXXX'
                            textAlign='center'
                            value={code}
                            onChangeText={(value) => setCode(value)}
                        />
                        <TouchableOpacity
                            onPress={verify}
                            style={styles.updateButton}
                        >
                            <Text style={styles.updateText}>Update Profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#555455"
    },
    header: {
        padding: 40,
        paddingBottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 40,
        color: '#FADEAD'
    },
    form: {
        padding: 40
    },
    input: {
        backgroundColor: '#FADEAD',
        padding: 10,
        borderRadius: 20,
        marginBottom: 20,
        elevation: 5
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    birthday: {
        backgroundColor: '#FADEAD',
        padding: 13,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    gender: {
        backgroundColor: '#FADEAD',
        borderRadius: 19.5,
        elevation: 5,
    },
    continue: {
        marginTop: 20,
        backgroundColor: '#333333',
        paddingVertical: 12,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 10,
        elevation: 5,
    },
    continueText: {
        color: '#F7D66A',
        fontSize: 14,
        fontWeight: 'bold',
    },
    imageUpload: {
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 20,
        backgroundColor: '#FADEAD',
        elevation: 5
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    verificationModalBackground: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)'
    },
    verificationModal: {
        backgroundColor: 'white',
        width: 300,
        height: 190,
        padding: 20,
        borderRadius: 10,
        elevation: 10
    },
    codeText: {
        fontSize: 15,
        marginBottom: 10
    },
    codeInput: {
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 10,
        padding: 5,
        marginBottom: 10,
    },
    updateButton: {
        marginTop: 10,
        backgroundColor: '#333333',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 10
    },
    updateText: {
        color: '#F7D66A',
        fontSize: 14,
        fontWeight: 'bold',
    }
})