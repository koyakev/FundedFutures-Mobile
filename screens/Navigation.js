import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, Pressable, Alert } from 'react-native';
import { Ionicons, MaterialIcons, AntDesign } from '@expo/vector-icons';
import { doc, getDoc, collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase/dbConnection';

export default function Navigation({ navigation, id}) {
    const [visible, setVisible] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [selectedOption, setSelectedOption] = useState('');
    const [hasNew, setHasNew] = useState(false);
    const [sending, setSending] = useState(false);

    const dashboard = () => {
        navigation.navigate('Dashboard', { id: id });
        navigation.goBack();
        navigation.push('Dashboard', {id: id});
    }

    const messages = () => {
        navigation.navigate('Messages', { id: id });
        navigation.goBack();
        navigation.navigate('Messages', { id: id });
    }

    const logout = () => {
        Alert.alert("Logout User?", "", [
            {
                text: "Logout",
                onPress: () => navigation.popToTop()
            },
            {
                text: "Cancel",
            }
        ])
    }
    
    const send = async () => {
        try {
            setSending(true);
            const feedbackData = await addDoc(collection(db, 'feedback'), {
                type: selectedOption,
                userId: id,
                detail: feedback,
            })

            await addDoc(collection(db, 'logs'), {
                activity: `Sent Feedback (ID: ${feedbackData.id})`,
                userId: id,
                timestamp: new Date(),
            });

            Alert.alert('Feedback successfully sent!');

            setVisible(false);
            setSending(false);
        } catch (error) {
            console.error('Error adding document: ', error);
        }
    }

    useEffect(() => {
        const getNew = async () => {
            const newMsgs = await getDocs(query(db, 'messages'), where('receiver', '==', id), where('messageStatus', '==', false));

            if(!newMsgs.empty) {
                setHasNew(true);
            }
        }
    }, [id])

    return (
        <>
            <View style={styles.nav}>
                <TouchableOpacity
                    onPress={dashboard}
                >
                    <AntDesign name="home" size={30} color="#FADEAD" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Profile', { id: id })}
                >
                    <Ionicons name="person-circle-outline" size={30} color="#FADEAD" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={messages}
                >
                    {hasNew ? (
                        <>
                        <Text
                            style={{
                                position: 'absolute',
                                top: -15,
                                left: 32,
                                fontSize: 24,
                                fontWeight: 'bold',
                                fontStyle: 'italic',
                                zIndex: 1,
                                color: '#FF4D4D',
                                elevation: 30
                            }}
                        >!</Text>
                        <AntDesign name="message1" size={30} color="#FADEAD" />                    
                        </>
                    ) : (
                        <>
                        <AntDesign name="message1" size={30} color="#FADEAD" />
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setVisible(true)}
                >
                    <AntDesign name="profile" size={30} color="#FADEAD" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={logout}
                >
                    <AntDesign name="logout" size={30} color="red" />
                </TouchableOpacity>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={visible}
                onRequestClose={() => setVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.titleText}>Send us your feedback!</Text>
                        <Text style={styles.subtitleText}>Do you have a suggestion or found some bugs? Let us know in the field below.</Text>
                        <Text style={styles.feedbackQuestion}>How was your experience?</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Describe your experience here..."
                            multiline
                            numberOfLines={4}
                            value={feedback}
                            onChangeText={value => setFeedback(value)}
                        />

                        <View style={styles.radioGroup}>
                            <Pressable
                                style={styles.radioButton}
                                onPress={() => setSelectedOption('Bug')}
                            >
                                <View style={[styles.radioCircle, selectedOption === 'Bug' && styles.radioCircleSelected]} />
                                <Text style={styles.radioText}>Bug</Text>
                            </Pressable>

                            <Pressable
                                style={styles.radioButton}
                                onPress={() => setSelectedOption('Suggestion')}
                            >
                                <View style={[styles.radioCircle, selectedOption === 'Suggestion' && styles.radioCircleSelected]} />
                                <Text style={styles.radioText}>Suggestion</Text>
                            </Pressable>

                            <Pressable
                                style={styles.radioButton}
                                onPress={() => setSelectedOption('Others')}
                            >
                                <View style={[styles.radioCircle, selectedOption === 'Others' && styles.radioCircleSelected]} />
                                <Text style={styles.radioText}>Others</Text>
                            </Pressable>

                        </View>
                        {!sending ? (
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={send}
                                    >
                                    <Text style={styles.buttonText}>Send Feedback</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.close}
                                    onPress={() => setVisible(false)}
                                >
                                    <Text style={styles.closeText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.button}>
                                <Text style={styles.buttonText}>Sending...</Text>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    nav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 15,
        marginLeft: 20,
        marginRight: 20,
        borderTopWidth: 1,
        borderTopColor: 'gray',
        borderTopStyle: 'solid',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalView: {
        width: 300,
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
    titleText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    subtitleText: {
        fontSize: 12,
        textAlign: 'center',
        color: '#6C757D',
        marginBottom: 20,
    },
    feedbackQuestion: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    input: {
        width: '100%',
        height: 80,
        borderColor: '#E0E0E0',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15,
        textAlignVertical: 'top',
        backgroundColor: '#F8F9FA',
    },
    radioGroup: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 20,
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioCircle: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#007BFF',
        marginRight: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioCircleSelected: {
        backgroundColor: '#007BFF',
    },
    radioText: {
        fontSize: 12,
        color: '#333',
    },
    button: {
        backgroundColor: '#007BFF',
        borderRadius: 8,
        padding: 10,
        marginTop: 10,
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    modalButtons: {
        alignItems: 'space-evenly',
        justifyContent: 'space-evenly',
        width: '100%',
    },
    close: {
        backgroundColor: 'lightgray',
        borderRadius: 8,
        padding: 10,
        marginTop: 10
    },
    closeText: {
        fontWeight: 'bold',
    }
})