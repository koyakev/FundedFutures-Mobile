import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, TextInput, Alert, ActivityIndicator, TouchableOpacity, Modal, StatusBar } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AntDesign from '@expo/vector-icons/AntDesign';
import { SelectList } from 'react-native-dropdown-select-list';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import Checkbox from 'expo-checkbox';
import { ref, uploadBytes } from 'firebase/storage';

import { db, storage } from '../firebase/dbConnection';

import { collection, addDoc, getDocs, query, doc, where, getDoc } from 'firebase/firestore';

export default function SignupStudent({ navigation }) {
    const [schools, setSchools] = useState(null);

    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [school, setSchool] = useState('');
    const [program, setProgram] = useState('');
    const [studentId, setStudentId] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [date, setDate] = useState(new Date());
    const [show, setShow] = useState(false);
    const [gender, setGender] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hidden, setHidden] = useState(true);
    const [hiddenC, setHiddenC] = useState(true);
    const [contact, setContact] = useState('');
    const [agreement, setAgreement] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const fetchSchools = async () => {
            const schoolsQuery = await getDoc(doc(db, 'system', 'partnerSchools'));
            setSchools(schoolsQuery.data());
        }
        fetchSchools();
    }, [])

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setDate(currentDate);
        setShow(false);
    }

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaType,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    }

    const checkEmail = async (insertedEmail) => {
        const emailQuery = await getDocs(query(collection(db, 'students'), where('email', '==', insertedEmail)));

        if (emailQuery.empty) {
            return false;
        } else {
            return true;
        }
    }

    const checkPassword = (insertedPassword) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&,.])[A-Za-z\d@$!%*?&,]{8,}$/;
        return passwordRegex.test(insertedPassword);
    }

    const addStudent = async () => {
        setLoading(true);
        const emailTaken = await checkEmail(email);
        const passwordValid = checkPassword(password);

        console.log(passwordValid);

        if (firstname == '' || lastname == '' || school == '' || contact == '' || program == '' || studentId == '' || username == '' || email == '' || gender == '' || password == '' || image == null) {
            Alert.alert('Please fill in necessary information');
            setLoading(false);

        } else if (emailTaken) {
            Alert.alert('Email already taken');
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
                setEmail('');
                setDate(new Date());
                setGender('');
                setPassword('');
                setConfirmPass('');
                setContact('');

                const { uri } = await FileSystem.getInfoAsync(image);
                const blob = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.onload = () => {
                        resolve(xhr.response);
                    };
                    xhr.onerror = (e) => {
                        reject(new TypeError('Network request failed'));
                    };
                    xhr.responseType = 'blob';
                    xhr.open('GET', uri, true);
                    xhr.send(null);
                });

                const filename = image.substring(image.lastIndexOf('/') + 1);
                //const imageRef = ref(storage, `${docRef.id}/${filename}`);

                //await uploadBytes(imageRef, blob);

                setImage(null);
                navigation.navigate('Verification', {
                    user: {
                        firstname: firstname,
                        lastname: lastname,
                        school: school,
                        course: program,
                        contact: contact,
                        studentId: studentId,
                        username: username,
                        email: email,
                        birthday: date.toLocaleDateString(),
                        gender: gender,
                        password: password,
                        filename: filename,
                        blob: blob,
                        applications: 0
                    }
                });
            } catch (e) {
                console.error('Error: ', e)
            }
        }
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#4D4D4D" />
            {schools ? (
                <ScrollView>
                    <View style={styles.header}>
                        <Pressable
                            onPress={() => navigation.goBack()}
                        >
                            <AntDesign name="arrowleft" size={50} color="#FADEAD" />
                        </Pressable>
                        <Text style={styles.label}>Sign Up</Text>
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
                                search={false}
                            />
                        </View>

                        <View>
                            <Text style={[styles.label, { fontSize: 16, marginBottom: 5, marginTop: 20 }]}>Select Course: </Text>
                            <SelectList
                                setSelected={(value) => setProgram(value)}
                                data={schools.courses}
                                boxStyles={[styles.input, { marginBottom: 0 }]}
                                search={false}
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
                        <TextInput
                            style={[styles.input, { marginBottom: 5 }]}
                            placeholder="Email Address"
                            value={email}
                            onChangeText={value => setEmail(value)}
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
                                    search={false}
                                />
                            </View>
                        </View>
                        <View style={[styles.input, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'  }]}>
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
                        <View style={[styles.input, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
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
                        >* 8 characters{"\n"}* One lowercased character{"\n"}* One uppercased character{"\n"}* One number{"\n"}* One special character</Text>
                        <View>
                            {!image ? (
                                <TouchableOpacity
                                    style={styles.imageUpload}
                                    onPress={pickImage}
                                >
                                    <AntDesign name="plus" size={24} color="#555455" />
                                    <Text>Upload Profile Picture</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={styles.imageUpload}
                                    onPress={pickImage}
                                >
                                    <AntDesign name="plus" size={24} color="#555455" />
                                    <Text style={{ fontWeight: 'bold' }}>Select New Profile Picture</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <Pressable style={styles.continue} onPress={() => setVisible(true)}>
                            <Text style={styles.continueText}>Sign Up</Text>
                        </Pressable>
                        
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

            <Modal
                animationType="slide"
                transparent={true}
                visible={visible}
                onRequestClose={() => setVisible(!visible)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTextTitle}>Privacy Policy Agreement</Text>
                        <Text style={styles.modalTextContent}>
                            By checking this box, I confirm that I have read and agree to the terms outlined in the Privacy Policy, including the collection, use, and sharing of my personal data as required by the Data Privacy Act of 2012. I understand my rights regarding data access, correction, and deletion.
                        </Text>
                        <Pressable
                            onPress={() => setAgreement(!agreement)}
                            style={styles.agree}
                        >
                            <Checkbox value={agreement} onValueChange={() => setAgreement(!agreement)} />
                            <Text style={styles.agreeText}>I agree to the privacy policy agreement</Text>
                        </Pressable>
                        {!loading ? (
                            agreement ? (
                                <TouchableOpacity style={styles.agreed} onPress={addStudent}>
                                    <Text style={styles.agreedText}>Sign Up</Text>
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.disagreed}>
                                    <Text>Sign Up</Text>
                                </View>
                            )
                        ) : (
                            <View style={styles.agreed}>
                                <ActivityIndicator
                                    size="small"
                                    color="#FADEAD"
                                />
                            </View>
                        )}
                        
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
        marginTop: 10,
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
        flexDirection: 'row',
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'space-evenly',
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
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalView: {
        width: 350,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 10,
    },
    modalTextTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 10,
    },
    modalTextContent: {
        marginBottom: 10,
        fontSize: 15,
        textAlign: 'center'
    },
    agree: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        marginLeft: 1,
    },
    agreeText: {
        padding: 10,
        fontStyle: 'italic'
    },
    agreed: {
        backgroundColor: '#333333',
        paddingVertical: 10,
        width: 300,
        alignItems: 'center',
        borderRadius: 10,
    },
    agreedText: {
        color: '#F7D66A',
        fontSize: 14,
        fontWeight: 'bold'
    },
    disagreed: {
        backgroundColor: '#CCCCCC',
        paddingVertical: 10,
        width: '100%',
        alignItems: 'center',
        borderRadius: 10,
    }
})